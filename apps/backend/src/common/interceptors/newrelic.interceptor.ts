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

    return newrelic.startWebTransaction(handlerName, () => {
      const transaction = newrelic.getTransaction();

      return next.handle().pipe(
        tap(() => {
          transaction.end();
        }),
        catchError((error) => {
          transaction.end();
          throw error;
        }),
      );
    });
  }
}