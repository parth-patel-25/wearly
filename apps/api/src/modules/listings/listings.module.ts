import { Module } from "@nestjs/common";
import { ListingsController } from "./listings.controller.js";
import { ListingsService } from "./listings.service.js";
import { ListingsDiscoveryService } from "./listings-discovery.service.js";

@Module({
  controllers: [ListingsController],
  providers: [ListingsService, ListingsDiscoveryService],
})
export class ListingsModule {}
