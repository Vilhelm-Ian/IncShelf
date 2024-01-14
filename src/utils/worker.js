export default function createWorker(fn) {
  let blob = new Blob(['self.onmessage = ', fn.toString()], { type: 'text/javascript' });
  let url = URL.createObjectURL(blob);
  
  return new Worker(url);
}
