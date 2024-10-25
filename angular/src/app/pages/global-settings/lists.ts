export const ASSETS_LISTS = {
  FILE_EXTENSION: [
    {
      value: 'Documents',
      id: 'doc',
      formats: 'doc, docx, odt, pages, rtf, tex, txt, wpd, wps, ps, eps, pdf, xlr, xls, xlsx, ppt, pptx, pps, odp',
    },
    {
      value: 'Data Files',
      id: 'data',
      formats: 'csv, dat, gbr, ged, ibooks, key, keychain, sdf, tar, tax2012, vcf, xml, log, msg, pst, json',
    },
    { value: 'Audio', id: 'audio', formats: 'aif, iff, m3u, m4a, mid, mp3, mpa, ra, wav, wma' },
    { value: 'Video', id: 'video', formats: '3g2, 3gp, asf, asx, avi, flv, mov, mp4, mpg, rm, srt, swf, vob, wmv' },
    {
      value: 'Image',
      id: 'image',
      formats: '3dm, 3ds, max, obj, bmp, dds, gif, jpg, jpeg, png, psd, pspimage, tga, thm, tif, tiff, yuv, svg',
    },
    { value: 'Compressed', id: 'zip', formats: '7z, cbr, deb, gz, pkg, rar, rpm, sitx, targz, zip, zipx' },
    { value: 'Disk Image', id: 'disk', formats: 'bin, cue, dmg, iso, mdf, toast, vcd' },
    {
      value: 'Code',
      id: 'code',
      formats:
        'js, cs, php, html, htm, md, css, py, po, jsp, jsx, aspx, swift, strings, cpp, ts, pot, graphql, java, class, c, cgi, pl, h, vb',
    },
    { value: 'Other', id: 'other', formats: 'Any extension not included previously' },
  ],
  EXTRA_CATEGORIES: [
    { id: 'ECONOMIC_PRESS', value: 'Economic press' },
    { id: 'SECURITY_COMPANIES', value: 'Security companies' },
    { id: 'SELF_REGULATORY_ORGANIZATION', value: 'Self regulatory organization' },
    { id: 'OFFICIAL_ORGANIZATION', value: 'Official organization' },
    { id: 'THINK_TANK', value: 'Think tank' },
    { id: 'BANKING_THINK_TANK', value: 'Banking think tank' },
  ],
  FORMATS: {
    doc: {
      value: 'Documents',
      formats: 'doc, docx, odt, pages, rtf, tex, txt, wpd, wps, ps, eps, pdf, xlr, xls, xlsx, ppt, pptx, pps, odp',
    },
    data: {
      value: 'Data Files',
      formats: 'csv, dat, gbr, ged, ibooks, key, keychain, sdf, tar, tax2012, vcf, xml, log, msg, pst, json',
    },
    audio: { value: 'Audio', formats: 'aif, iff, m3u, m4a, mid, mp3, mpa, ra, wav, wma' },
    video: { value: 'Video', formats: '3g2, 3gp, asf, asx, avi, flv, mov, mp4, mpg, rm, srt, swf, vob, wmv' },
    image: {
      value: 'Image',
      formats: '3dm, 3ds, max, obj, bmp, dds, gif, jpg, jpeg, png, psd, pspimage, tga, thm, tif, tiff, yuv, svg',
    },
    zip: { value: 'Compressed', formats: '7z, cbr, deb, gz, pkg, rar, rpm, sitx, targz, zip, zipx' },
    disk: { value: 'Disk Image', formats: 'bin, cue, dmg, iso, mdf, toast, vcd' },
    other: { value: 'Other', formats: 'Any extension not included previously' },
    code: {
      value: 'Code',
      formats:
        'js, cs, php, html, htm, md, css, py, po, jsp, jsx, aspx, swift, strings, cpp, ts, pot, graphql, java, class, c, cgi, pl, h, vb',
    },
  },
};
