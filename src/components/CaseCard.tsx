import { Case } from '../lib/supabase';

interface CaseCardProps {
  caseData: Case;
  onClick: () => void;
}

export default function CaseCard({ caseData, onClick }: CaseCardProps) {
  return (
    <div
      onClick={onClick}
      className="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20"
    >
      <div className="aspect-[3/4] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
        <img
          src={caseData.image_url}
          alt={caseData.name}
          className="w-full h-full object-cover"
        />

        <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
          <h3 className="text-white font-bold text-lg mb-2">{caseData.name}</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 bg-blue-500/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-blue-500/30">
              <svg className="w-5 h-5" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M28 56C43.464 56 56 43.464 56 28C56 12.536 43.464 0 28 0C12.536 0 0 12.536 0 28C0 43.464 12.536 56 28 56Z" fill="#0098EA"/>
                <path d="M37.5603 15.6277H18.4386C14.9228 15.6277 12.6944 19.4202 14.4632 22.4861L26.2644 42.9409C27.0345 44.2765 28.9644 44.2765 29.7345 42.9409L41.5381 22.4861C43.3045 19.4251 41.0761 15.6277 37.5627 15.6277H37.5603Z" fill="white"/>
              </svg>
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
