import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';

@Catch(HttpException)
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const exceptionResponse = exception.getResponse();
    const exceptionMessage = exception.message;
    const exceptionStatus = exception.getStatus();

    response.status(exceptionStatus).json({
      statusCode: exceptionStatus,
      message: exceptionMessage,
      ...(typeof exceptionResponse === 'object' ? exceptionResponse : {}),
      exception: {
        ...exception,
        status: undefined,
        response: undefined,
        statusCode: undefined,
        message: undefined,
      },
    });
  }
}
