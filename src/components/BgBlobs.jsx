export default function BgBlobs() {
  return (
    <>
      <div className="blob w-44 h-44 bg-[#FFE08A] -top-10 -right-10"
        style={{ animationDuration: '9s', animationDelay: '0s' }} />
      <div className="blob w-36 h-36 bg-[#FF5533] top-20 -left-14"
        style={{ animationDuration: '12s', animationDelay: '-4s' }} />
      <div className="blob w-32 h-32 bg-[#FFD07A] bottom-4 -right-6"
        style={{ animationDuration: '15s', animationDelay: '-8s' }} />
    </>
  )
}
