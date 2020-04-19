import { Injectable } from '@nestjs/common';
import { launch } from 'puppeteer';
import { resolve } from 'path';
import axios from 'axios';
import { createWriteStream, unlinkSync, mkdirSync, existsSync } from 'fs';
import { CreateAlbumDTO } from './dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Album, Link } from './interfaces';
import { remove, includes } from 'lodash';
import * as getUrls from 'get-urls';

@Injectable()
export class AppService {
  constructor(@InjectModel('Album') private albumModel: Model<Album>) {}

  parserURL(url: string): Link[] {

    const links = Array.from( getUrls(url) );
    const instagramArray: Link[] = [];

    for (const link of links) {
      if ( includes(link, 'instagram') ) {
        instagramArray.push({ link, instagram: true });
      } else {
        instagramArray.push({ link, instagram: false });
      }
    }
    
    return instagramArray;
  }

  async getImagesInstagram(url: string): Promise<string[]> {
    const browser = await launch({ headless: true });
    const page = await browser.newPage();

    await page.goto('https://instagram.com/accounts/login/');
    await page.waitForSelector('[name=username]', {
        visible: true,
    });

    await page.type('[name=username]', 'username');
    await page.type('[name=password]', 'password');

    await page.click('[type=submit]');

    await page.goto(url);
    await page.waitForSelector('img', {
        visible: true,
    });

    const data = await page.evaluate( () => {
        const images = document.querySelectorAll('img');

        const urls = Array.from(images).map(v => v.src);

        return urls;
    });

    await browser.close();

    return data;
  }

  async getImagesNotInstagram(url: string): Promise<string[]> {
    const browser = await launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(url);
    await page.waitForSelector('img', {
        visible: true,
    });

    const data = await page.evaluate( () => {
      const images = document.querySelectorAll('img');

      const urls = Array.from(images).map(v => v.src);

      return urls;
    });

    await browser.close();

    return data;
  }

  async getImages(name: string): Promise<string[]> {
    const { images } = await this.albumModel.findOne({ name }).exec();
    return images.map(image => `http://localhost:3000/${image}`);
  }

  async downloadImages(name: string, images: string[]): Promise<string[]> {
    const files: string[] = [];
    let directory: string;
    let number = 1;

    const dir = resolve(__dirname, `../images/${name}`);
    if (!existsSync(dir)) mkdirSync(dir);

      for (const url of images) {
        
        const response = await axios({
          method: 'GET',
          url,
          responseType: 'stream',
        });
        
        if ( response.headers['content-length'] >= 250 * 250 &&
            (response.headers['content-type'] === 'image/jpeg' ||
             response.headers['content-type'] === 'image/png') ) {

          if (response.headers['content-type'] === 'image/jpeg') {
            directory = resolve(__dirname, `../images/${name}`, `image${number}.jpg`);
            files.push(`${name}/image${number}.jpg`);
          } else {
            directory = resolve(__dirname, `../images/${name}`, `image${number}.png`);
            files.push(`${name}/image${number}.png`);
          }
          
          number += 1;

          await response.data.pipe(createWriteStream(directory));
        }
      }

    return files;
  }

  async createAlbum(body: CreateAlbumDTO): Promise<Album[]> {
    const albums: Album[] = [];
    const links = this.parserURL(body.url);

    for (const [key, { link, instagram }] of links.entries()) {
      let data: string[]
      const name = body.names[key];

      if (instagram) {
        data = await this.getImagesInstagram(link);
      } else {
        data = await this.getImagesNotInstagram(link);
      }

      const images = await this.downloadImages(name, data);
      const createAlbum = new this.albumModel({ name, images });
      const album = await createAlbum.save();

      albums.push(album);
    }
    return albums;
  }

  async removeImageFromAlbum(imageID: number, albumName: string): Promise<string[]> {
    const { images } = await this.albumModel.findOne({ name: albumName }).exec();

    unlinkSync(resolve(__dirname, '../images', albumName, `image${imageID}.jpg`));
    remove(images, image => includes(image, 'image' + imageID));

    this.albumModel.updateOne({ name: albumName }, { $set: { images } }).exec();
    return images;
  }
}
