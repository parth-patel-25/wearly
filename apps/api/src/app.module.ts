import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { AdminModule } from "./admin/admin.module.js";
import { auth } from "./auth.js";
import { LoggingInterceptor } from "./common/logging.interceptor.js";
import { HealthModule } from "./health/health.module.js";
import { NotesModule } from "./notes/notes.module.js";

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
