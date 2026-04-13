import { Controller, Get } from '@nestjs/common';
import { SearchService } from './search.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { ProductCreatedEvent } from 'apps/catalog/src/products/product.events';
import { ProductCreatedDto } from './events/product-events.dto';
import { SeaerchQueryDto } from './search/search-query.dto';

@Controller()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}



  @EventPattern('product.created')
  async onProductCreated(@Payload() payload: ProductCreatedDto){
    console.log(payload)

    await this.searchService.upsertFromCatalogEvent({
      productId: payload.productId,
      name: payload.name,
      description: payload.description,
      status: payload.status,
      price: payload.price
    })
  }


  @MessagePattern('search.query')
  async query(@Payload() payload: SeaerchQueryDto){
    return this.searchService.query({
      q: payload.q,
      limit: payload.limit
    })
  }


  @MessagePattern('service.ping')
  ping(){
    return this.searchService.ping()
  }
}
