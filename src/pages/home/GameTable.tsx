import React from 'react';

enum Room {
  BOT,
  BEGINNER,

}
type Props = {
  id: number
};

const GameTable: React.FC<Props> = () => {
  return (
    <div className="w-96 h-96 relative">
      <div className="w-96 h-96 left-0 top-0 absolute bg-zinc-300 rounded-2xl" />
      <div
        className="w-96 h-12 left-[378.62px] top-[20.08px] absolute text-black text-4xl font-normal font-['Arial']">Beginner
        - Room 1
      </div>
      <div className="w-48 h-16 left-[473px] top-[573px] absolute">
        <div className="w-11 h-11 left-0 top-0 absolute bg-purple-200 rounded-full" />
        <div className="w-32 h-16 left-[57px] top-0 absolute text-black text-2xl font-normal font-['Arial']">You
          (Host)<br /></div>
        <div className="left-[57px] top-[36px] absolute text-black text-base font-normal font-['Arial']">Elo: 220</div>
      </div>
      <div className="w-48 h-16 left-[473px] top-[151px] absolute">
        <div className="w-11 h-11 left-0 top-0 absolute bg-purple-200 rounded-full" />
        <div className="w-32 h-16 left-[57px] top-0 absolute text-black text-2xl font-normal font-['Arial']">Harry</div>
        <div className="left-[57px] top-[36px] absolute text-black text-base font-normal font-['Arial']">Elo: 220</div>
      </div>
      <div className="w-96 h-px left-[1.13px] top-[83.67px] absolute border border-black"></div>
      <div className="w-32 h-9 left-[508px] top-[420px] absolute">
        <div className="w-32 h-9 left-0 top-0 absolute bg-lime-600 rounded-lg" />
        <div
          className="w-14 h-6 left-[31.15px] top-[7.40px] absolute text-black text-xl font-normal font-['Arial']">Ready
        </div>
      </div>
      <div className="w-32 h-9 left-[425px] top-[478px] absolute">
        <div className="w-32 h-9 left-0 top-0 absolute bg-lime-600 rounded-lg" />
        <div
          className="w-16 h-5 left-[27.54px] top-[7.24px] absolute text-black text-base font-normal font-['Arial']">Set
          stake
        </div>
      </div>
      <div className="w-28 h-9 left-[600px] top-[478px] absolute">
        <div className="w-28 h-9 left-0 top-0 absolute bg-orange-800 rounded-lg" />
        <div
          className="w-9 h-5 left-[39.48px] top-[7px] absolute text-black text-base font-normal font-['Arial']">Kick
        </div>
      </div>
      <div className="left-[524px] top-[283px] absolute">
        <div className="left-[16px] top-0 absolute text-black text-5xl font-normal font-['Asul']">VS</div>
        <div className="left-0 top-[63px] absolute text-black text-xl font-normal font-['Arial']">Stake: 8G</div>
      </div>
      <div className="left-[482px] top-[389px] absolute text-black text-xl font-normal font-['Arial']">Wait for
        opponent...
      </div>
      <div className="w-16 h-9 left-[22px] top-[27px] absolute bg-stone-500 rounded-2xl" />
      <div className="w-6 h-6 left-[42px] top-[34px] absolute" />
    </div>
  )
}

export default GameTable;