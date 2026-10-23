// Keeps the top `height` pixels of an image: crop-top.swift <in> <out> <height>
// (sips can only crop around the middle). Used by app-shots.mjs.
import Foundation
import ImageIO
import UniformTypeIdentifiers

let args = CommandLine.arguments
guard args.count == 4, let keep = Int(args[3]),
      let source = CGImageSourceCreateWithURL(URL(fileURLWithPath: args[1]) as CFURL, nil),
      let image = CGImageSourceCreateImageAtIndex(source, 0, nil),
      let cropped = image.cropping(to: CGRect(x: 0, y: 0, width: image.width, height: min(keep, image.height))),
      let dest = CGImageDestinationCreateWithURL(URL(fileURLWithPath: args[2]) as CFURL, UTType.png.identifier as CFString, 1, nil)
else { FileHandle.standardError.write("usage: crop-top.swift <in> <out> <height>\n".data(using: .utf8)!); exit(1) }
CGImageDestinationAddImage(dest, cropped, nil)
exit(CGImageDestinationFinalize(dest) ? 0 : 1)
