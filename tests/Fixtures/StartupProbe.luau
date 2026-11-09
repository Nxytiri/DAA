--//LuauProgrammer
--//StartupProbe
--//2026-11-08
--!strict

local StartupProbe = { _started = false }

function StartupProbe.OnStart(Self: typeof(StartupProbe)): ()
	assert(not Self._started, "Startup called twice")
	Self._started = true
	script:SetAttribute("Started", true)
end

return StartupProbe
