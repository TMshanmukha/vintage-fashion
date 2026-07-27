export const getThumbnail = (
    url,
    width = 100,
    height = 100
) => {

    if (!url) return "/no-image.png";

    return url.replace(
        "/upload/",
        `/upload/f_auto,q_auto,w_${width},h_${height},c_fill/`
    );

};