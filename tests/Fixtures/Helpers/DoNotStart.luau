--//LuauProgrammer
--//DoNotStart
--//2026-11-08
--!strict

local DoNotStart = {}

function DoNotStart.Init(): () end

function DoNotStart.Start(): ()
	script:SetAttribute("Started", true)
end

return DoNotStart
