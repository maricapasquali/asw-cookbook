import * as path from "path"

type Path = {
    path(filename?: string, resource?: MediaResource): string
}

interface MediaResource {
    name: string
    Image(filename?: string): string
    Video(filename?: string): string
}

export namespace FilesystemResource {

    export const Image: Path = {
        path(filename?: string, resource?: MediaResource): string {
            return PathJoin("images", filename, resource)
        }
    }

    export const Video: Path = {
        path(filename?: string, resource?: MediaResource): string {
            return PathJoin("videos", filename, resource)
        }
    }

    export const Icon: Path = {
        path(filename?: string): string {
            return PathJoin("icons", filename)
        }
    }

    export const Email: Path = {
        path(filename?: string): string {
            return PathJoin("emails", filename)
        }
    }

    export const USERS: MediaResource = BasicMediaResource("users")

    export const RECIPES: MediaResource = BasicMediaResource("recipes")

    export const CHATS: MediaResource = BasicMediaResource("chats")

    /*-- PRIVATE --*/

    function PathJoin(subDirectory: string, filename?: string, resource?: MediaResource): string {
        return path.resolve((resource ? path.join(__dirname, resource.name): __dirname), subDirectory, filename || "")
    }

    function BasicMediaResource(name: string): MediaResource {
        return new class implements MediaResource {
            name: string = name

            Image(filename?: string): string {
                return Image.path(filename, this)
            }

            Video(filename?: string): string {
                return Video.path(filename, this)
            }
        }
    }

}
