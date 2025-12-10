import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

import { BlobWriter, TextReader, ZipWriter } from '@zip.js/zip.js';

const entryNames = ['mimetype', 'gibberish', 'MIMETYPE'];
const compressionMethods = [0, 8];
const mimetypes = ['application/zip', 'application/x-nmrium+zip'];
const extendedTimestamps = [true, false];

await mkdir(join(import.meta.dirname, '../zips'), { recursive: true });

for (const extendedTimestamp of extendedTimestamps) {
  for (const entryName of entryNames) {
    for (const mimetype of mimetypes) {
      for (const compressionMethod of compressionMethods) {
        await test(entryName, mimetype, compressionMethod, extendedTimestamp);
      }
    }
  }
}

async function test(
  entryName: string,
  mimetype: string,
  compressionMethod: number,
  extendedTimestamp: boolean,
) {
  const zipWriter = new ZipWriter(new BlobWriter());

  await zipWriter.add(entryName, new TextReader(mimetype), {
    compressionMethod,
    extendedTimestamp,
  });
  await zipWriter.add('file.txt', new TextReader('Hello World!'));

  const blob = await zipWriter.close();

  const filename = `${entryName}-${mimetype.split('/')[1]}-${compressionMethod}-${extendedTimestamp}.zip`;
  const filePath = relative(
    process.cwd(),
    join(import.meta.dirname, '../zips', filename),
  );
  await writeFile(filePath, blob.stream());

  try {
    const fileProcess = spawn('file', [filePath], {
      stdio: 'inherit',
    });
    await once(fileProcess, 'close');
  } catch (error) {
    console.error(error);
  }
}
