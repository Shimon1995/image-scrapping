import { IsString, IsOptional, Min, IsNumber } from 'class-validator';

export class CreateAlbumDTO {
    @IsString()
    url: string;
    @IsOptional()
    @Min(5)
    names: string[];
}

export class DeleteImageDTO {
    @IsNumber()
    imagenumber: number;
}
