declare module 'archiver' {
  import { Writable } from 'stream'

  export interface EntryData {
    name?: string
  }

  export interface Archiver extends Writable {
    file(filepath: string, data?: EntryData): Archiver
    finalize(): Promise<void>
    pipe(destination: NodeJS.WritableStream): NodeJS.WritableStream
    append(
      source: NodeJS.ReadableStream | Buffer | string,
      data?: EntryData
    ): Archiver
    directory(dirpath: string, destpath?: string): Archiver
    on(event: 'warning', handler: (error: Error) => void): this
    on(event: 'error', handler: (error: Error) => void): this
  }

  interface ArchiverOptions {
    zlib?: {
      level?: number
    }
  }

  export default function archiver(
    format: string,
    options?: ArchiverOptions
  ): Archiver
}
