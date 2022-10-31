import { omit } from 'radash'
import * as t from './types'

// Used to detect if a thrown error
// was produced by this module or not
export const ERROR_TYPE: t.AbstractError['type'] = '@error:json'

/**
 * There is a 1 in 1,000,000,000 chance that someone may
 * return an object with _type equal to '@exobase:response'
 * and this will break. Nobody do that...
 */
export const isAbstractResponse = (res: any): res is t.AbstractResponse => {
  return (res as t.AbstractResponse)?._type === '@exobase:response'
}

export const isAbstractError = (err: any): err is t.AbstractError => {
  return (err as t.AbstractError)?.type === ERROR_TYPE
}

export const defaultResponse: t.AbstractResponse = {
  _type: '@exobase:response',
  status: 200,
  headers: {},
  body: {
    message: 'success'
  }
}

export const responseFromResult = (result: any): t.AbstractResponse => {
  if (isAbstractResponse(result)) return result
  // If nothing was returned then return the default
  // success response
  // Else, the func returned something that should be
  // returned as the json body response
  return {
    ...defaultResponse,
    body: {
      result: !result ? defaultResponse.body : result,
      status: defaultResponse.status,
      error: null
    }
  }
}

export const responseFromError = (error: any): t.AbstractResponse => {
  if (isAbstractResponse(error)) return error
  // Else its some generic error, wrap it in our
  // error object as an unknown error
  return {
    ...defaultResponse,
    status: error.status ?? 500,
    body: {
      result: null,
      status: error.status ?? 500,
      error: isAbstractError(error)
        ? omit(error, ['type'])
        : {
            key: 'err.unknown',
            message: 'Unknown Error',
            cause: 'UNKNOWN',
            note: 'This one is on us, we apologize. The issue has been logged and our development team will be working on a fix asap.'
          }
    }
  }
}
