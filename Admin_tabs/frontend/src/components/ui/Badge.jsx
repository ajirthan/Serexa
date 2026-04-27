export default function Badge({ text, color = 'yellow' }) {
  const colors = {
    yellow: 'bg-[#FFE500] text-black',
    green:  'bg-green-500 text-white',
    red:    'bg-red-500 text-white',
    gray:   'bg-[#333] text-gray-300',
  };
  return (
    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${colors[color]}`}>
      {text}
    </span>
  );
}