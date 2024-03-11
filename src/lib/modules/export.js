import FileSaver from 'file-saver';

export function saveAs(params = {}) {
  const { file, filename, data, type } = {
    // defaults
    type: 'text/plain',
    // overrides
    ...params
  };

  if (file) {
    FileSaver.saveAs(file);
  } else {
    const blob = new Blob([data], { type });
    FileSaver.saveAs(blob, filename);
  }
}

export function createFile(params = {}) {
  const { filename, data, type } = {
    // defaults
    type: 'text/plain',
    // overrides
    ...params
  };

  const blob = new Blob([data], { type });
  return new File([blob], filename, { type });
}