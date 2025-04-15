import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

const util = require("util");
const newrelic = require("newrelic");

@Injectable()
export class NewrelicInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return newrelic.startWebTransaction(context.getHandler().name, () => {
      const transaction = newrelic.getTransaction();
      return next.handle().pipe(
        tap(() => {
          console.log(
            `Parent Interceptor after: ${util.inspect(
              context.getHandler().name,
            )}`,
          );
          return transaction.end();
        }),
      );
    });
  }
}