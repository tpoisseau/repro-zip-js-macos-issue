import { writeFile } from 'node:fs/promises';

import { BlobWriter, TextReader, ZipWriter } from '@zip.js/zip.js';

import { isMimetype } from './signature_check.ts';

async function working() {
  const filename = 'macos-working-but-not-signature-compatible.zip';
  const zipWriter = new ZipWriter(new BlobWriter());

  const entry = await zipWriter.add(
    'mimetype',
    new TextReader('application/zip'),
    {
      compressionMethod: 0,
      extendedTimestamp: false, // smaller payload, the extra field is empty
    },
  );

  const blob = await zipWriter.close();
  await writeFile(filename, blob.stream());

  console.log(filename, 'written');

  const arrayBuffer = await blob.arrayBuffer();
  const matchSignature = isMimetype(arrayBuffer, 'application/zip');

  const headerPlusDataSize = 53;
  const dataDescriptorSize = 12;
  const nextPossibleHeaderSize = 4;
  const buffer = Buffer.from(arrayBuffer);
  const bufferSlice = buffer
    .subarray(
      0,
      headerPlusDataSize +
        entry.rawExtraField.byteLength +
        dataDescriptorSize +
        nextPossibleHeaderSize,
    )
    .toString('hex');

  console.log(
    `working: true, matchSignature: ${matchSignature}\nbufferSlice: ${bufferSlice}\nbuffer: ${buffer.toString('hex')}`,
  );
}

async function notWorking() {
  const filename = 'macos-not-working-but-signature-check-compatible.zip';
  const zipWriter = new ZipWriter(new BlobWriter());

  const entry = await zipWriter.add(
    'mimetype',
    new TextReader('application/zip'),
    {
      compressionMethod: 0,
      // ensures the data length is written in the local file header,
      // but it seems macOS struggle to decode if the data descriptor is missing.
      dataDescriptor: false,
      extendedTimestamp: false, // smaller payload, the extra field is empty
    },
  );

  const blob = await zipWriter.close();
  await writeFile(filename, blob.stream());

  console.log(filename, 'written');

  const arrayBuffer = await blob.arrayBuffer();
  const matchSignature = isMimetype(arrayBuffer, 'application/zip');

  const headerPlusDataSize = 53;
  const dataDescriptorSize = 12;
  const nextPossibleHeaderSize = 4;
  const buffer = Buffer.from(arrayBuffer);
  const bufferSlice = buffer
    .subarray(
      0,
      headerPlusDataSize +
        entry.rawExtraField.byteLength +
        dataDescriptorSize +
        nextPossibleHeaderSize,
    )
    .toString('hex');

  console.log(
    `working: false, matchSignature: ${matchSignature}\nbufferSlice: ${bufferSlice}\nbuffer: ${buffer.toString('hex')}`,
  );
}

await working();
console.log();
await notWorking();
