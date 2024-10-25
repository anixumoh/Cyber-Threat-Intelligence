import { ModuleSettingsDetailService } from '../../../../detail/module-settings-detail.service';
import { GenericParameter } from '../generic-parameter/generic-parameter';

export class FileExtensions {
  checkboxValues = [
    {
      name: 'Documents',
      value: 'doc',
      selected: false,
      formats: 'doc, docx, odt, pages, rtf, tex, txt, wpd, wps, ps, eps, pdf, xlr, xls, xlsx, ppt, pptx, pps, odp',
    },
    {
      name: 'Data Files',
      value: 'data',
      selected: false,
      formats: 'csv, dat, gbr, ged, ibooks, key, keychain, sdf, tar, tax2012, vcf, xml, log, msg, pst, json',
    },
    {
      name: 'Audio',
      value: 'audio',
      selected: false,
      formats: 'aif, iff, m3u, m4a, mid, mp3, mpa, ra, wav, wma',
    },
    {
      name: 'Video',
      value: 'video',
      selected: false,
      formats: '3g2, 3gp, asf, asx, avi, flv, mov, mp4, mpg, rm, srt, swf, vob, wmv',
    },
    {
      name: 'Image',
      value: 'image',
      selected: false,
      formats: '3dm, 3ds, max, obj, bmp, dds, gif, jpg, jpeg, png, psd, pspimage, tga, thm, tif, tiff, yuv, svg',
    },
    {
      name: 'Compressed',
      value: 'zip',
      selected: false,
      formats: '7z, cbr, deb, gz, pkg, rar, rpm, sitx, targz, zip, zipx',
    },
    {
      name: 'Disk Image',
      value: 'disk',
      selected: false,
      formats: 'bin, cue, dmg, iso, mdf, toast, vcd',
    },
    {
      name: 'Code',
      value: 'code',
      selected: false,
      formats:
        'js, cs, php, html, htm, md, css, py, po, jsp, jsx, aspx, swift, strings, cpp, ts, pot, graphql, java, class, c, cgi, pl, h, vb',
    },
    { name: 'Other', value: 'other', selected: false, formats: 'Any extension not included previously' },
  ];
  checkboxValuesEntity = {
    doc: 0,
    data: 1,
    audio: 2,
    video: 3,
    image: 4,
    zip: 5,
    disk: 6,
    code: 7,
    other: 8,
  };
  constructor(
    private moduleSettingsDetailService: ModuleSettingsDetailService,
    private parameterObject: GenericParameter
  ) {}

  public activateCheckboxes() {
    this.parameterObject.parameterData.forEach((element) => {
      this.checkboxValues[this.checkboxValuesEntity[element.value]].selected = true;
    });
  }

  public sendStatus(value) {
    if (value.selected) {
      this.parameterObject.data.values_to_add = [{ value: value.value }];
      this.parameterObject.sendData();
    } else {
      this.parameterObject.selectedItems = [{ value: value.value }];
      this.parameterObject.deleteData();
    }
  }
}
