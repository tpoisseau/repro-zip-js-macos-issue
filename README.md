# repro-zip-js-macos-issue

MacOS incompatibility with `zip.js`:

Refs: https://github.com/cheminfo/file-collection/issues/79

After further investigations to reproduce in minimal environment the issue,
It seems `zip.js` produce invalid zip when `extendedTimestamp` is set to false.

## Prerequisites

- Node.js >= 24
- `file` cli tool in `PATH` (optional, but produce errors in console otherwise)

## Run

```console
git clone https://github.com/cheminfo/repro-zip-js-macos-issue.git
cd repro-zip-js-macos-issue
npm install
node src/index.ts
```

### Expected result

```
zips/mimetype-zip-0-true.zip: Zip archive data, at least v2.0 to extract, compression method=store
zips/mimetype-zip-8-true.zip: Zip archive data, at least v2.0 to extract, compression method=deflate
zips/mimetype-x-nmrium+zip-0-true.zip: Zip archive data, at least v2.0 to extract, compression method=store
zips/mimetype-x-nmrium+zip-8-true.zip: Zip archive data, at least v2.0 to extract, compression method=deflate
zips/gibberish-zip-0-true.zip: Zip archive data, at least v2.0 to extract, compression method=store
zips/gibberish-zip-8-true.zip: Zip archive data, at least v2.0 to extract, compression method=deflate
zips/gibberish-x-nmrium+zip-0-true.zip: Zip archive data, at least v2.0 to extract, compression method=store
zips/gibberish-x-nmrium+zip-8-true.zip: Zip archive data, at least v2.0 to extract, compression method=deflate
zips/mimetype-zip-0-false.zip: Zip data (MIME type "application/zipN"?)
zips/mimetype-zip-8-false.zip: Zip data (MIME type "K,("?)
zips/mimetype-x-nmrium+zip-0-false.zip: Zip data (MIME type "application/x-nmrium+zipf"?)
zips/mimetype-x-nmrium+zip-8-false.zip: Zip data (MIME type "K,("?)
zips/gibberish-zip-0-false.zip: Zip archive data, at least v2.0 to extract, compression method=store
zips/gibberish-zip-8-false.zip: Zip archive data, at least v2.0 to extract, compression method=deflate
zips/gibberish-x-nmrium+zip-0-false.zip: Zip archive data, at least v2.0 to extract, compression method=store
zips/gibberish-x-nmrium+zip-8-false.zip: Zip archive data, at least v2.0 to extract, compression method=deflate
```

The 4 files MacOS is not able to uncompress are:

```
zips/mimetype-zip-0-false.zip: Zip data (MIME type "application/zipN"?)
zips/mimetype-zip-8-false.zip: Zip data (MIME type "K,("?)
zips/mimetype-x-nmrium+zip-0-false.zip: Zip data (MIME type "application/x-nmrium+zipf"?)
zips/mimetype-x-nmrium+zip-8-false.zip: Zip data (MIME type "K,("?)
```

The mimetype files extracted by `file` command are wrong.
For compressed variant I think it must be ignored,
but for the uncompressed variant, one extra character is recovered.
`application/zipN` should be `application/zip` and `application/x-nmrium+zipf` should be `application/x-nmrium+zip`.

To check on another OS, I used docker:

```console
docker run -it -v "$(pwd)/zips/mimetype-zip-0-false.zip:/zips/mimetype-zip-0-false.zip" ubuntu:latest bash
apt update && apt install file
file /zips/mimetype-zip-0-false.zip
# /zips/mimetype-zip-0-false.zip: Zip data (MIME type "application/zipN"?)
```

So if both `file` extract wrong mimetype, it should be a bug in the zip writer.

### NB:

unzip command (both macos and linux), The unarchiver app (a userland app for macos) works fine and they extract the mimetype file correctly.
