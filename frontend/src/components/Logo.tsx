import { Sparkles } from "lucide-react";

const Logo = ({ collapsed = false }: { collapsed?: boolean }) => (
  <div className="flex items-center gap-2">
    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-retro-charcoal">
      <Sparkles className="h-5 w-5 text-retro-gold" />
    </div>
    {!collapsed && (
      <span className="text-lg font-bold font-heading">SkillSync</span>
    )}
  </div>
);

export default Logo;
