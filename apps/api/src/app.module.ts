import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor.js";
import { auth } from "./core/auth/auth.js";
import { AdminModule } from "./modules/admin/admin.module.js";
import { FavouritesModule } from "./modules/favourites/favourites.module.js";
import { HealthModule } from "./modules/health/health.module.js";
import { ListingsModule } from "./modules/listings/listings.module.js";
import { NotesModule } from "./modules/notes/notes.module.js";
import { RentalsModule } from "./modules/rentals/rentals.module.js";
import { StorageModule } from "./modules/storage/storage.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ["../../.env", ".env"],
      isGlobal: true,
    }),
    AuthModule.forRoot({ auth }),
    AdminModule,
    FavouritesModule,
    HealthModule,
    ListingsModule,
    NotesModule,
    RentalsModule,
    StorageModule,
  ],
  providers: [{ provide: APP_INTERCEPTOR, useClass: LoggingInterceptor }],
})
export class AppModule {}
