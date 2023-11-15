import { readdir, stat } from "fs/promises";
import { execSync } from "child_process";

const CRANK_UP_OXI_PNG_COMPRESSION = false
const oxi_compression = CRANK_UP_OXI_PNG_COMPRESSION ? '-o max' : '-o 0'

const images_directory = new URL(
  "/Users/tgross/Downloads/test-images",
  import.meta.url
);

const oxi_destination_directory = new URL("./oxi-images", import.meta.url);

const libpng_destination_directory = new URL("./images", import.meta.url);

const executable_location = new URL(
  "./DerivedData/png-benchmarks/Build/Products/Release/png-benchmarks",
  import.meta.url
);

const images = await readdir(images_directory);
const pngs = images.filter((image) => image.endsWith('.png'))
const times = {};

for (const image_path of pngs) {
  const full_in_path = new URL(image_path, `${images_directory}/`);
  const stats = await stat(full_in_path);

  const original_size_kb = stats.size / 1000;
  times[image_path] = { original_size_kb };

  console.log(`Compressing ${image_path} with libpng...`);
  const start = performance.now();
  execSync(`${executable_location.pathname} ${image_path}`);
  const end = performance.now();

  const libpng_compression_time_ms = end - start;
  times[image_path].libpng_compression_time_ms = libpng_compression_time_ms;

  const full_libpng_out_path = new URL(
    image_path,
    `${libpng_destination_directory}/`
  );
  const libpng_stats = await stat(full_libpng_out_path);
  const libpng_compressed_size_kb = libpng_stats.size / 1000;

  times[image_path].libpng_compressed_size_kb = libpng_compressed_size_kb;
  const libpng_percent_change = Math.abs(
    (libpng_compressed_size_kb / original_size_kb) * 100 - 100
  );
  times[image_path].libpng_percent_change = libpng_percent_change;

  console.log(`Compressing ${image_path} with oxipng...`);
  const full_oxi_out_path = new URL(
    image_path,
    `${oxi_destination_directory}/`
  );

  const oxi_start = performance.now();
  execSync(
    `oxipng ${oxi_compression} ${full_in_path.pathname} --out ${full_oxi_out_path.pathname}`
  );
  const oxi_end = performance.now();

  const oxi_stats = await stat(full_oxi_out_path);
  const oxipng_compression_time_ms = oxi_end - oxi_start;
  times[image_path].oxipng_compression_time_ms = oxipng_compression_time_ms;

  const oxipng_compressed_size_kb = oxi_stats.size / 1000;
  times[image_path].oxipng_compressed_size_kb = oxipng_compressed_size_kb;

  const oxipng_percent_change = Math.abs(
    (oxipng_compressed_size_kb / original_size_kb) * 100 - 100
  );
  times[image_path].oxipng_percent_change = oxipng_percent_change;

  const faster_compressor =
    oxipng_compression_time_ms < libpng_compression_time_ms ? "oxipng" : "libpng";

  const smaller_file =
    oxipng_percent_change > libpng_percent_change ? "oxipng" : "libpng";
  times[
    image_path
  ].conclusion = `${faster_compressor} compresses the file faster by ${Math.round(
    Math.abs(oxipng_compression_time_ms - libpng_compression_time_ms)
  )}ms <===> ${smaller_file} generates a smaller file by ${Math.round(
    Math.abs(oxipng_percent_change - libpng_percent_change)
  )}%`;
}

console.log("===========================================");
console.log(times);
