import React, { useState } from 'react';
import { ArrowRight, Crosshair, Lock, Sparkles } from 'lucide-react';
import { GlassButton } from '../components/glass/GlassButton';
import { GlassIconButton } from '../components/glass/GlassIconButton';
import { GlassInput } from '../components/glass/GlassInput';
import { GlassSelect } from '../components/glass/GlassSelect';
import { GlassSwitch } from '../components/glass/GlassSwitch';
import { GlassTabsCard } from '../components/glass/GlassTabsCard';
import { GlassPlanCard } from '../components/glass/GlassPlanCard';
import { LiquidGlass } from '../components/glass/LiquidGlass';
import { PriorityChip, PriorityLegend, TypeChip } from '../components/glass/GlassBadges';
import { PriorityLevel, TRAINING_TYPE_THEMES, TrainingType } from '../theme/tokens';

interface ShowcaseScreenProps {
  onEnterApp: () => void;
  darkSurface: boolean;
  onToggleSurface: (dark: boolean) => void;
}

export const ShowcaseScreen: React.FC<ShowcaseScreenProps> = ({
  onEnterApp,
  darkSurface,
  onToggleSurface,
}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedDemo, setSelectedDemo] = useState(true);
  const [switchOn, setSwitchOn] = useState(true);
  const [activeTab, setActiveTab] = useState('find');
  const [demoPriority, setDemoPriority] = useState<PriorityLevel>('R');

  const cyclePriority = () => {
    const order: PriorityLevel[] = ['R', 'B', 'G'];
    setDemoPriority((p) => order[(order.indexOf(p) + 1) % order.length]);
  };

  return (
    <div className="mx-auto w-full max-w-[960px] px-4 py-6 sm:px-6 sm:py-8">
      {/* Header matching reference image */}
      <div className="mb-7 flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h1
            className={`text-[34px] sm:text-[42px] font-bold tracking-[-0.04em] leading-none lowercase ${
              darkSurface ? 'text-white' : 'text-[#111318]'
            }`}
          >
            liquid glass
          </h1>
          <p className={`mt-1.5 text-xs font-medium ${darkSurface ? 'text-white/60' : 'text-[#555b69]'}`}>
            QINXVI UI Kit · 1:1 optical refraction system
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium ${darkSurface ? 'text-white/75' : 'text-[#313542]'}`}>
            Liquid Glass UI Kit Showcase
          </span>
        </div>
      </div>

      {/* Reference 2-column Showcase Grid (exact 8 components) */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* 1. Primary Button */}
        <GlassButton
          label="Start workout"
          variant="primary"
          size="lg"
          fullWidth
          onClick={onEnterApp}
        />

        {/* 2. Secondary Button (pink/orange gradient glass) */}
        <GlassButton
          label="Secondary"
          variant="secondary"
          size="lg"
          fullWidth
          onClick={() => setSelectedDemo((v) => !v)}
        />

        {/* 3. Icon Button */}
        <GlassIconButton
          icon={<Crosshair className="h-4.5 w-4.5" />}
          label="Icon button"
          variant="cyan"
          onClick={onEnterApp}
        />

        {/* 4. Text field with search icon */}
        <GlassInput
          value={searchText}
          onChange={setSearchText}
          placeholder="Text field"
        />

        {/* 5. Select with checkmark */}
        <GlassSelect
          label="Select"
          selected={selectedDemo}
          onToggle={() => setSelectedDemo((v) => !v)}
        />

        {/* 6. Switch toggle */}
        <GlassSwitch
          label="Switch"
          checked={switchOn}
          onChange={setSwitchOn}
        />

        {/* 7. Tabs Card */}
        <GlassTabsCard
          title="Tabs"
          activeTabId={activeTab}
          onSelectTab={setActiveTab}
          tabs={[
            { id: 'find', label: 'Find files...' },
            { id: 'collab', label: 'Add collaborator' },
          ]}
        />

        {/* 8. Pro Plan Card */}
        <GlassPlanCard
          title="Pro plan"
          subtitle="Focus ring, hover states,"
          footerLeft="Disabled states"
          footerRight={3}
          onClick={cyclePriority}
        />
      </div>

      {/* Disabled & Interactive States Check */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <GlassButton label="Disabled state" variant="primary" disabled fullWidth />
        <GlassSwitch
          label={darkSurface ? 'Charcoal studio' : 'Light studio'}
          checked={darkSurface}
          onChange={onToggleSurface}
        />
        <GlassButton
          label="Enter QINXVI App"
          variant="secondary"
          fullWidth
          rightSlot={<ArrowRight className="h-4 w-4" />}
          onClick={onEnterApp}
        />
      </div>

      {/* Geometric Liquid Glass Shapes + Tactile Haptics */}
      <div className="mt-9">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2
            className={`text-xl font-bold tracking-tight lowercase ${
              darkSurface ? 'text-white' : 'text-[#111318]'
            }`}
          >
            geometric liquid glass shapes & haptic triggers
          </h2>
          <span className={`text-xs ${darkSurface ? 'text-white/60' : 'text-[#555b69]'}`}>
            Tap any shape for spring compression + custom haptic waveform
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="flex flex-col items-center gap-2">
            <LiquidGlass
              variant="cyan"
              shape="circle"
              haptic="medium"
              onClick={() => setSelectedDemo((v) => !v)}
              className="h-24 w-24"
            >
              <div className="flex h-full flex-col items-center justify-center text-center">
                <span className="text-xs font-bold">Circle</span>
                <span className="text-[10px] text-white/65">Medium</span>
              </div>
            </LiquidGlass>
          </div>

          <div className="flex flex-col items-center gap-2">
            <LiquidGlass
              variant="secondary"
              shape="square"
              haptic="heavy"
              onClick={() => setSwitchOn((v) => !v)}
              className="h-24 w-24 p-3"
            >
              <div className="flex h-full flex-col items-center justify-center text-center">
                <span className="text-xs font-bold">Square</span>
                <span className="text-[10px] text-white/65">Heavy</span>
              </div>
            </LiquidGlass>
          </div>

          <div className="flex flex-col items-center gap-2">
            <LiquidGlass
              variant="goldGreen"
              shape="squircle"
              haptic="pulse"
              onClick={cyclePriority}
              className="h-24 w-24 p-3"
            >
              <div className="flex h-full flex-col items-center justify-center text-center">
                <span className="text-xs font-bold">Squircle</span>
                <span className="text-[10px] text-white/65">Pulse</span>
              </div>
            </LiquidGlass>
          </div>

          <div className="flex flex-col items-center justify-center gap-2 py-2">
            <LiquidGlass
              variant="primary"
              priority={demoPriority}
              shape="diamond"
              haptic="rankReveal"
              onClick={cyclePriority}
              className="h-20 w-20"
            >
              <div className="flex h-full flex-col items-center justify-center text-center">
                <span className="text-[11px] font-bold">Diamond</span>
                <span className="text-[9px] text-white/70">Rank</span>
              </div>
            </LiquidGlass>
          </div>

          <div className="flex flex-col items-center justify-center">
            <LiquidGlass
              variant="cyan"
              shape="arch"
              haptic="celebrate"
              onClick={() => setSelectedDemo((v) => !v)}
              className="h-24 w-full p-3"
            >
              <div className="flex h-full flex-col items-center justify-center text-center">
                <span className="text-xs font-bold">Arch Portal</span>
                <span className="text-[10px] text-white/65">Hero / Timer · Celebrate</span>
              </div>
            </LiquidGlass>
          </div>

          <div className="flex flex-col items-center justify-center">
            <LiquidGlass
              variant="secondary"
              shape="bevel"
              haptic="toggleOn"
              onClick={() => setSwitchOn((v) => !v)}
              className="h-24 w-full p-3"
            >
              <div className="flex h-full flex-col items-center justify-center text-center">
                <span className="text-xs font-bold">Kinetic Bevel</span>
                <span className="text-[10px] text-white/65">Sets / Logs · Toggle On</span>
              </div>
            </LiquidGlass>
          </div>

          <div className="col-span-2 flex items-center">
            <LiquidGlass
              variant="silver"
              shape="pill"
              haptic="double"
              onClick={onEnterApp}
              className="w-full py-5 px-6"
            >
              <div className="flex flex-col items-center text-center">
                <span className="text-xs font-bold">Capsule Pill · Double Haptic</span>
                <span className="text-[10px] text-white/70">Press-down tick + double snap</span>
              </div>
            </LiquidGlass>
          </div>
        </div>
      </div>

      {/* Training Types & Priority Neon Outlines */}
      <div className="mt-9">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2
            className={`text-xl font-bold tracking-tight lowercase ${
              darkSurface ? 'text-white' : 'text-[#111318]'
            }`}
          >
            training type glass tints & priority neon outlines
          </h2>
          <PriorityLegend darkSurface={darkSurface} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(TRAINING_TYPE_THEMES) as TrainingType[]).map((type, idx) => {
            const priorities: PriorityLevel[] = ['R', 'B', 'G'];
            const p = idx === 0 ? demoPriority : priorities[idx % 3];
            return (
              <LiquidGlass
                key={type}
                trainingType={type}
                priority={p}
                shape="card"
                as="button"
                onClick={cyclePriority}
                className="p-4 text-left"
              >
                <div className="flex items-center justify-between gap-2">
                  <TypeChip type={type} />
                  <PriorityChip priority={p} />
                </div>
                <p className="mt-3 text-sm font-semibold text-white">
                  {TRAINING_TYPE_THEMES[type].label}
                </p>
                <p className="mt-0.5 text-xs text-white/65">
                  Glass tint + bottom caustic glow
                </p>
              </LiquidGlass>
            );
          })}
        </div>
      </div>

      {/* Bottom Launch Bar */}
      <div
        className={`mt-8 flex flex-col items-center justify-between gap-4 rounded-[26px] border p-4 backdrop-blur-md sm:flex-row ${
          darkSurface
            ? 'border-white/12 bg-white/8 text-white'
            : 'border-black/8 bg-white/45 text-[#111318]'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              darkSurface ? 'bg-white text-[#111318]' : 'bg-[#111318] text-white'
            }`}
          >
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <p className={`text-sm font-semibold ${darkSurface ? 'text-white' : 'text-[#111318]'}`}>
              Ready to launch QINXVI Workout Manager
            </p>
            <p className={`text-xs ${darkSurface ? 'text-white/65' : 'text-[#555b69]'}`}>
              Access code: <span className="font-mono font-bold">QINXVI</span> · 390×844 mobile-first experience
            </p>
          </div>
        </div>
        <GlassButton
          label="Launch QINXVI"
          variant="primary"
          rightSlot={<Sparkles className="h-4 w-4" />}
          onClick={onEnterApp}
        />
      </div>
    </div>
  );
};
