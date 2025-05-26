interface PageTitleProps {
  title: string;
  className?: string;
  subtitle?: string; // 선택적 부제목
}

export function PageTitle({ title, className, subtitle }: PageTitleProps) {
  return (
    <div className={`mb-12 text-center ${className || ''}`}>
      <h1 className="text-6xl font-bold tracking-tight text-primary sm:text-7xl lg:text-8xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-4 text-xl text-muted-foreground">
          {subtitle}
        </p>
      )}
    </div>
  );
} 