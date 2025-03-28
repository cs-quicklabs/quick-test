import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap, catchError } from "rxjs/operators";
import * as newrelic from "newrelic";

@Injectable()
export class NewrelicInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const handlerName = context.getHandler().name;

    // Prevent logging in non-production environments
    if (process.env.NODE_ENV === "production") {
      console.log(`New Relic Interceptor: Tracking ${handlerName}`);
    }

    return newrelic.startWebTransaction(handlerName, () => {
      const transaction = newrelic.getTransaction();

      return next.handle().pipe(
        tap(() => {
          if (process.env.NODE_ENV === "production") {
            console.log(`New Relic: Completed ${handlerName}`);
          }
          transaction.end();
        }),
        catchError((error) => {
          console.error(`New Relic Error in ${handlerName}:`, error);
          transaction.end();
          throw error;
        }),
      );
    });
  }
}