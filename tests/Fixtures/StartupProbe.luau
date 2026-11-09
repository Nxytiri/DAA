--//LuauProgrammer
--//StartupProbe
--//2026-11-08
--!strict

-- A yielding fixture exposes a loader that starts modules before require finishes.
task.wait(0.02)
script:SetAttribute("Required", true)
local StartupProbe = { _started = false }

function StartupProbe.Init(): ()
	for _, Module in script.Parent:GetChildren() do
		if Module:IsA("ModuleScript") then
			assert(Module:GetAttribute("Required") == true, "Init ran before every require completed")
		end
	end
	script:SetAttribute("Initialized", true)
end

function StartupProbe.Start(Self: typeof(StartupProbe)): ()
	local PeerName = if script.Name == "StartupProbe" then "SecondProbe" else "StartupProbe"
	local Peer = script.Parent:FindFirstChild(PeerName)
	assert(Peer ~= nil and Peer:GetAttribute("Initialized") == true, "Start ran before all Init hooks")
	assert(not Self._started, "Startup called twice")
	Self._started = true
	script:SetAttribute("Starting", true)
	local Deadline = os.clock() + 2
	while Peer:GetAttribute("Starting") ~= true and os.clock() < Deadline do
		task.wait()
	end
	assert(Peer:GetAttribute("Starting") == true, "Start hooks were not dispatched asynchronously")
	script:SetAttribute("Started", true)
end

return StartupProbe
