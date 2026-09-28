import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  Logger,
  type NestInterceptor,
} from "@nestjs/common";
import { type Observable, tap } from "rxjs";

/** Minimal shape of the request we log, avoiding a dependency on express types. */
interface LoggableRequest {
  method: string;
  url: string;
}

/** Logs method, path, status and duration for every request. */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<LoggableRequest>();
    const startedAt = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const ms = Date.now() - startedAt;
          this.logger.log(
            `${request.method} ${request.url} ${http.getResponse().statusCode} ${ms}ms`
          );
        },
      })
    );
  }
}
