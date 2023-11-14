#include <iostream>
#include <png.h>
#include <filesystem>

namespace fs = std::filesystem;

const fs::path destination_directory = fs::path("/Users/tgross/Documents/GitHub/peng-benchmarks-3/png-benchmarks/images");
const fs::path images_directory = fs::path("/Users/tgross/Downloads/test-images");

const char* one_image = "/54585431-ad20-4b61-bcc2-ab9ad9e23650.png";

int main() {
//    for (const auto& file : fs::directory_iterator(images_directory)) {
//        std::cout << file.path() << std::endl;
//    }
    
//    png_create_write_struct(PNG_LIBPNG_VER_STRING, NULL, NULL, NULL);
    
    png_image image {.version = PNG_IMAGE_VERSION, .opaque = NULL};
    auto one_image_path = fs::path(images_directory).concat(one_image);
    
    auto valid_read_start = png_image_begin_read_from_file(&image, one_image_path.c_str());
    
    if (valid_read_start) {
        image.format = PNG_FORMAT_RGBA;
        
        auto buffer = malloc(PNG_IMAGE_SIZE(image));
        auto valid_read_end = png_image_finish_read(&image, NULL, buffer, 0, NULL);
        
        if (buffer != NULL && valid_read_end) {
            auto output_path = fs::path(destination_directory).concat(one_image);
            png_image_write_to_file(&image, output_path.c_str(), 0, buffer, 0, NULL);
        }
    } else {
        std::cout << "Invalid read start" << std::endl;
    }
}
