import 'multer'
import { Body, Controller, Get, Inject, Param, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { CurrentUser } from "../auth/current-user.decorator";
import type { UserContext } from "../auth/auth.types";
import { mapRpcErrorToHttp } from "@app/rpc";
import { firstValueFrom } from "rxjs";
import { AdminOnly } from "../auth/admin.decorator";
import { Public } from "../auth/public.decorator";
import { FileInterceptor } from "@nestjs/platform-express";



type Product = {
    _id: string;
    name: string;
    description: string;
    price: number;
    status: 'DRAFT' | 'ACTIVE';
    imageUrl?: string | undefined;
    createdByClerkUserId: boolean
}

@Controller()
export class ProductsHttpController{
    constructor(
        // Gateway talks to catalog via RMQ client
        @Inject('CATALOG_CLIENT') private readonly catalogClient: ClientProxy,

        @Inject('MEDIA_CLIENT') private readonly mediaClient: ClientProxy
    ){}



    //media and image logic later placeholder
    @Post('products')
    @AdminOnly()
    @UseInterceptors(
        FileInterceptor('image', {
            limits: {
                fieldSize: 5 * 1024 * 1024
            }
        })
    )
    async createProduct(
        @CurrentUser() user: UserContext,
        @UploadedFile() file: Express.Multer.File | undefined,
        @Body()
        body: {
            name: string,
            description: string,
            price: number,
            status?: string,
            imageUrl?: string
        }
    ) {
        //do the basic validation -> just for practice

        let imageUrl: string | undefined = undefined;
        let mediaId: string | undefined = undefined;

        if(file){
            const base64 = file.buffer.toString('base64');

            try{
                const uploadResult = await firstValueFrom(
                    this.mediaClient.send('media.uploadProductImage', {
                        fileName: file.originalname,
                        mimeType: file.mimetype,
                        base64,
                        uploadByUserId: user.clerkUserId
                    })
                )

                imageUrl = uploadResult.url;
                mediaId = uploadResult.mediaId;

            }catch(error){
                console.error('Media upload error:', error)
            }
        }


        let product : Product

        const payload = {
            name: body.name,
            description: body.description,
            price: Number(body.price),
            status: body.status,
            imageUrl,
            createdByClerkUserId: user.clerkUserId
        }

        console.log("The payload", payload)

        // RMQ request and response pattern

        try{
            product = await firstValueFrom(
                this.catalogClient.send('product.create', payload)
            )

        }catch (error){
            mapRpcErrorToHttp(error)
        }

        if(mediaId){
            try{
                await firstValueFrom(
                    this.mediaClient.send('media.attachToProduct',{
                        mediaId,
                        productId: String(product._id),
                        attachedByUserId: user.clerkUserId,
                    } )
                )
            }catch(error){
                mapRpcErrorToHttp(error)
            }
        }


        return product;
    }

    @Get('products')
    @Public()
    async listProducts(){
        try{
            return await firstValueFrom(this.catalogClient.send('product.list', {}))
        }catch (error){
            mapRpcErrorToHttp(error)
        }
    }


    @Get('products/:id')
    @Public()
    async getProduct(@Param('id') id: string){
        try{
            return await firstValueFrom(this.catalogClient.send('product.getById', {id}))
        }catch (err){
            mapRpcErrorToHttp(err)
        }
    }
}