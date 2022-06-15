import * as path from "path"

type Path = {
    /**
     * @param filename (optional) name of the file to find the absolute path for
     * @param resource (optional) name of the resource to find the absolute path for
     * @return absolute path of the file or the resource
     */
    path: (filename?: string, resource?: MediaResource) => string
}

interface MediaResource {
    /**
     * name of resource
     */
    name: string

    /**
     * @param filename (optional) name of the file to find the absolute path for
     * @return absolute path of the resource images
     */
    Image: (filename?: string) => string

    /**
     * @param filename (optional) name of the file to find the absolute path for
     * @return absolute path of the videos of the resource
     */
    Video: (filename?: string) => string
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

}

/* -- PRIVATE -- */
function PathJoin(subDirectory: string, filename?: string, resource?: MediaResource): string {
    return path.resolve((resource ? path.join(__dirname, resource.name) : __dirname), subDirectory, filename || "")
}

function BasicMediaResource(name: string): MediaResource {
    return new class implements MediaResource {
        name: string = name

        Image(filename?: string): string {
            return FilesystemResource.Image.path(filename, this)
        }

        Video(filename?: string): string {
            return FilesystemResource.Video.path(filename, this)
        }
    }()
}
