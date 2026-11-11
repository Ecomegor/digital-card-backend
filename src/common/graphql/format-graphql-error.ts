import { unwrapResolverError } from '@apollo/server/errors';
import { HttpException, HttpStatus } from '@nestjs/common';
import { type GraphQLFormattedError } from 'graphql';

type GraphqlErrorFormatter = (
  formattedError: GraphQLFormattedError,
  error: unknown,
) => GraphQLFormattedError;

const INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR';

const codeByHttpStatus: Partial<Record<number, string>> = {
  [HttpStatus.BAD_REQUEST]: 'BAD_USER_INPUT',
  [HttpStatus.UNAUTHORIZED]: 'UNAUTHENTICATED',
  [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
  [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
};

function messageOf(exception: HttpException): string {
  const response = exception.getResponse();

  if (typeof response === 'object' && 'message' in response) {
    const { message } = response;

    if (Array.isArray(message)) {
      return message.join('; ');
    }

    if (typeof message === 'string') {
      return message;
    }
  }

  return exception.message;
}

export function createGraphqlErrorFormatter(isProduction: boolean): GraphqlErrorFormatter {
  return (formattedError, error) => {
    const originalError = unwrapResolverError(error);
    const isHttpException = originalError instanceof HttpException;
    const code = isHttpException
      ? (codeByHttpStatus[originalError.getStatus()] ?? INTERNAL_SERVER_ERROR)
      : formattedError.extensions?.code;
    const isInternal = code === INTERNAL_SERVER_ERROR;

    if (isInternal && isProduction) {
      return { message: 'Internal server error', extensions: { code } };
    }

    const stacktrace = isProduction ? undefined : formattedError.extensions?.stacktrace;

    return {
      message: isHttpException && !isInternal ? messageOf(originalError) : formattedError.message,
      ...(formattedError.locations && { locations: formattedError.locations }),
      ...(formattedError.path && { path: formattedError.path }),
      extensions: stacktrace === undefined ? { code } : { code, stacktrace },
    };
  };
}
