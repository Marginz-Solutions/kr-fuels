export function ImageGridSkeleton({ count = 18 }: { count?: number }) {
  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
        gap: 8,
        alignContent: 'start',
        padding: 2,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="sk"
          style={{
            aspectRatio: '1',
            borderRadius: 7,
            border: '2.5px solid transparent',
            boxSizing: 'border-box',
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
    </div>
  )
}