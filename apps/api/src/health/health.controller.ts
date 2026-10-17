import { Controller, Get } from "@nestjs/common";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
import type { HealthResponse } from "@wearly/shared/api/types";

// Health checks run without a session — probes and uptime monitors never log in.
@AllowAnonymous()
@Controller("health")
export class HealthController {
  @Get()
  check(): HealthResponse {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
    };
  }
}
