console.warn(
  'This SNAP widget script is deprecated. See https://gitlab.mim-libre.fr/rizomo/la-pastille to use newer versions',
);

const script = document.createElement('script');
script.src = '{{script}}';
script.defer = 'true';
script.type = 'application/javascript';

customElements.whenDefined('snap-widget').then(() => {
  const widget = document.createElement('div');
  widget.innerHTML = `<snap-widget url="{{url}}"></snap-widget>`;

  document.body.append(widget);
});

document.head.appendChild(script);
