--//LuauProgrammer
--//StartFailure
--//2026-11-08
--!strict

script:SetAttribute("Required", true)
local StartFailure = {}

function StartFailure.Init(): () end

function StartFailure.Start(): ()
	script:SetAttribute("Attempted", true)
	error("EXPECTED_START_FAILURE")
end

return StartFailure
