--//LuauProgrammer
--//InitFailure
--//2026-11-08
--!strict

script:SetAttribute("Required", true)
local InitFailure = {}

function InitFailure.Init(): ()
	script:SetAttribute("Failed", true)
	error("EXPECTED_INIT_FAILURE")
end

function InitFailure.Start(): ()
	script:SetAttribute("Started", true)
end

return InitFailure
