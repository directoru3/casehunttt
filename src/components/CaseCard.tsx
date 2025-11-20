import { Case } from '../lib/supabase';

interface CaseCardProps {
  caseData: Case;
  onClick: () => void;
}

export default function CaseCard({ caseData, onClick }: CaseCardProps) {
  return (
    <div
      onClick={onClick}
      className="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20"
    >
      <div className="aspect-[3/4] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
        <img
          src={caseData.image_url}
          alt={caseData.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
          <h3 className="text-white font-bold text-lg mb-2">{caseData.name}</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 bg-blue-500/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-blue-500/30">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                V
              </div>
              <span className="text-blue-300 font-bold">{caseData.price}</span>
            </div>
          </div>
        </div>

        {caseData.category === 'new' && (
          <div className="absolute top-3 right-3 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold z-20">
            NEW
          </div>
        )}
        {caseData.category === 'free' && (
          <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold z-20">
            FREE
          </div>
        )}
      </div>
    </div>
  );
}
