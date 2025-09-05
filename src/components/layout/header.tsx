export default function Header() {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">EA</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold">EduAgency</h1>
              <p className="text-xs text-muted-foreground">Education Consulting Platform</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}