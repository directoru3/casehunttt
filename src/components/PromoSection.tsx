import { Gift } from 'lucide-react';

export default function PromoSection() {
  return (
    <div className="px-4 mb-6">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20">
          <img
            src="https://media.bloomingbit.io/prod/news/31f31d04-c430-4cea-9889-7e84a4142347.webp"
            alt="Gift"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="text-white" size={24} />
            <span className="text-white font-bold text-lg">Free TON</span>
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">
              V
            </div>
          </div>
          <p className="text-white/90 text-sm mb-4">
            Get free TON on balance for subscribe on telegram channel
          </p>
          <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors">
            Take
            <span className="ml-2">▼</span>
          </button>
        </div>
      </div>
    </div>
  );
}
