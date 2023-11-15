import { readdir, stat } from "fs/promises";
import { execSync } from "child_process";

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
const times = {};

for (const image_path of images) {
  const full_in_path = new URL(image_path, `${images_directory}/`);
  const stats = await stat(full_in_path);

  const original_size_kb = stats.size / 1000;
  times[image_path] = { original_size_kb };

  console.log(`Compressing ${image_path} with libpng...`);
  const start = performance.now();
  execSync(`${executable_location.pathname} ${image_path}`);
  const end = performance.now();

  const libpng_time_ms = end - start;
  times[image_path].libpng_time_ms = libpng_time_ms;

  const full_libpng_out_path = new URL(
    image_path,
    `${libpng_destination_directory}/`
  );
  const libpng_stats = await stat(full_libpng_out_path);
  const libpng_size_kb = libpng_stats.size / 1000;

  times[image_path].libpng_size_kb = libpng_size_kb;
  const libpng_change_percentage = Math.abs(
    (libpng_size_kb / original_size_kb) * 100 - 100
  );
  times[image_path].libpng_change_percentage = libpng_change_percentage;

  console.log(`Compressing ${image_path} with oxipng...`);
  const full_oxi_out_path = new URL(
    image_path,
    `${oxi_destination_directory}/`
  );

  const oxi_start = performance.now();
  execSync(
    `oxipng ${full_in_path.pathname} --out ${full_oxi_out_path.pathname}`
  );
  const oxi_end = performance.now();

  const oxi_stats = await stat(full_oxi_out_path);
  const oxipng_time_ms = oxi_end - oxi_start;
  times[image_path].oxipng_time_ms = oxipng_time_ms;

  const oxipng_size_kb = oxi_stats.size / 1000;
  times[image_path].oxipng_size_kb = oxipng_size_kb;

  const oxipng_change_percentage = Math.abs(
    (oxipng_size_kb / original_size_kb) * 100 - 100
  );
  times[image_path].oxipng_change_percentage = oxipng_change_percentage;

  const faster_compressor =
    oxipng_time_ms < libpng_time_ms ? "oxipng" : "libpng";

  const smaller_file =
    oxipng_change_percentage > libpng_change_percentage ? "oxipng" : "libpng";
  times[
    image_path
  ].conclusion = `${faster_compressor} compresses the file faster by ${Math.round(
    Math.abs(oxipng_time_ms - libpng_time_ms)
  )}ms <===> ${smaller_file} generates a smaller file by ${Math.round(
    Math.abs(oxipng_change_percentage - libpng_change_percentage)
  )}%`;
}

console.log("===========================================");
console.log(times);
