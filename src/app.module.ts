import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AlbumSchema } from './album.schema';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI, 
    { useNewUrlParser: true, useUnifiedTopology: true }),
    MongooseModule.forFeature([{ name: 'Album', schema: AlbumSchema}]),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../', '../client/dist'),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../', '../client/images'),
      serveRoot: '/api/images',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
