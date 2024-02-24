import FileSaver from 'file-saver';

export default function saveAs(params = {}) {
  const { filename, data, type } = {
    // defaults
    type: 'text/plain',
    // overrides
    ...params
  };

  const blob = new Blob([data], { type });
  FileSaver.saveAs(blob, filename);
}
