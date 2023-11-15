#include <iostream>
#include <png.h>
#include <filesystem>
#include <fstream>
#include <string>
#include <chrono>
#include <functional>

//png_image image {.version = PNG_IMAGE_VERSION, .opaque = NULL};

//auto valid_read_start = png_image_begin_read_from_file(&image, one_image_path.c_str());
//if (!valid_read_start) {
//    printf("Invalid read start.");
//    return EXIT_FAILURE;
//}

//image.format = PNG_FORMAT_RGBA;
//auto image_buffer = malloc(PNG_IMAGE_SIZE(image));
//auto valid_read_end = png_image_finish_read(&image, NULL, image_buffer, 0, NULL);
//if (!valid_read_end || image_buffer == NULL) {
//    printf("Invalid read end or invalid buffer.");
//    return EXIT_FAILURE;
//}

//    png_set_compression_level(write_ptr, 5);
//    png_image_write_to_file(&image, output_path.c_str(), 0, buffer, 0, NULL);

//void mark_duration(std::function<void(void)> callback) {
//    auto start = std::chrono::high_resolution_clock::now();
//    callback();
//    auto end = std::chrono::high_resolution_clock::now();
//}

namespace fs = std::filesystem;

const fs::path destination_directory = fs::path("/Users/tgross/Documents/GitHub/peng-benchmarks-3/png-benchmarks/images");
const fs::path images_directory = fs::path("/Users/tgross/Downloads/test-images");

int main(int argc, const char* argv[]) {
    auto image_path = argv[1];
    auto input_file_path = fs::path(images_directory).concat("/").concat(image_path);

    auto read_ptr = png_create_read_struct(PNG_LIBPNG_VER_STRING, NULL, NULL, NULL);
    auto input_file = fopen(input_file_path.c_str(), "rb");
    png_init_io(read_ptr, input_file);
    
    auto input_info_ptr = png_create_info_struct(read_ptr);
    png_read_png(read_ptr, input_info_ptr, PNG_TRANSFORM_IDENTITY, NULL);

    auto output_path = fs::path(destination_directory).concat("/").concat(image_path);
    auto write_ptr = png_create_write_struct(PNG_LIBPNG_VER_STRING, NULL, NULL, NULL);
    
    auto output_file = fopen(output_path.c_str(), "wb");
    png_init_io(write_ptr, output_file);
    
    png_set_compression_buffer_size(write_ptr, 20 * 1024 * 1024); // 20MB compression buffer
    png_set_filter(write_ptr, 0, PNG_ALL_FILTERS);
    
    png_set_compression_level(write_ptr, 9);
    png_set_compression_mem_level(write_ptr, 9);
    png_set_compression_strategy(write_ptr, 1);
    png_set_compression_window_bits(write_ptr, 15);
    png_set_compression_method(write_ptr, 8);

    png_set_text_compression_level(write_ptr, 9);
    png_set_text_compression_mem_level(write_ptr, 9);
    png_set_text_compression_strategy(write_ptr, 1);
    png_set_text_compression_window_bits(write_ptr, 15);
    png_set_text_compression_method(write_ptr, 8);
    
    png_write_png(write_ptr, input_info_ptr, PNG_TRANSFORM_IDENTITY, NULL);
    printf("Compression of %s complete.", image_path);
}
