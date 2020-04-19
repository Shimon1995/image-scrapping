import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateAlbumDTO, DeleteImageDTO } from './dto';
import { Album } from './interfaces';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getPage(): string {
    return 'Vue.js page';
  }

  @Get(':album_name')
  getAlbum(@Param('album_name') id: string): Promise<string[]> {
    return this.appService.getImages(id);
  }

  @Post()
  createAlbum(@Body() body: CreateAlbumDTO): Promise<Album[]> {
    return this.appService.createAlbum(body);
  }

  @Delete(':album_name')
  removeItem(@Param('album_name') id: string, @Body() body: DeleteImageDTO): Promise<string[]> {
    return this.appService.removeImageFromAlbum(body.imagenumber, id);
  }
}
