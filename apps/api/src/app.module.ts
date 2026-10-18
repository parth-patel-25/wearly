import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor.js";
import { auth } from "./core/auth/auth.js";
import { AdminModule } from "./modules/admin/admin.module.js";
import { HealthModule } from "./modules/health/health.module.js";
import { NotesModule } from "./modules/notes/notes.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ["../../.env", ".env"],
      isGlobal: true,
    }),
    AuthModule.forRoot({ auth }),
    AdminModule,
    HealthModule,
    NotesModule,
  ],
  providers: [{ provide: APP_INTERCEPTOR, useClass: LoggingInterceptor }],
})
export class AppModule {}
