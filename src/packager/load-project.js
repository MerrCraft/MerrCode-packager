import * as Comlink from 'comlink';
import DownloadWorker from 'worker-loader?name=downloader.worker.js!./downloader.worker.js';
import {readAsArrayBuffer} from './lib/readers';
import xhr from './lib/xhr';

const downloadProject = async (buffer, progressCallback) => {
  const worker = new DownloadWorker();
  const wrap = Comlink.wrap(worker);
  const project = await wrap.downloadProject(Comlink.transfer(buffer, [buffer]), Comlink.proxy(progressCallback));
  worker.terminate();
  return project;
};

const fromID = async (id, progressCallback) => {
  const buffer = await xhr({
    url: `https://projects.scratch.mit.edu/${id}`,
    type: 'arraybuffer',
    progressCallback: (progress) => {
      progressCallback('fetch', progress);
    }
  });
  return downloadProject(buffer, progressCallback);
};

const fromFile = async (file, progressCallback) => {
  const buffer = await readAsArrayBuffer(file);
  return downloadProject(buffer, progressCallback);
};

export default {
  fromID,
  fromFile
};
