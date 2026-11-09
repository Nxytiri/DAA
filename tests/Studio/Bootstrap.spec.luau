--//LuauProgrammer
--//BootstrapSpec
--//2026-11-08
--!strict

local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local ServerScriptService = game:GetService("ServerScriptService")

return function(): ()
	local IsServer = RunService:IsServer()
	local Parent: Instance = if IsServer
		then ServerScriptService
		else Players.LocalPlayer:WaitForChild("PlayerScripts")
	local DAA = Parent:WaitForChild("DAA")
	local Template = DAA:WaitForChild("Bootstrap")
	assert(Template:IsA("BaseScript"), "Production bootstrap missing")

	local TestRoot = Instance.new("Folder")
	TestRoot.Name = "DAABootstrapCheck"
	local Fixtures = script.Parent.Fixtures:Clone()
	Fixtures.Name = if IsServer then "Services" else "Controllers"
	Fixtures.Parent = TestRoot
	local Bootstrap = Template:Clone()
	Bootstrap.Enabled = false
	Bootstrap.Parent = TestRoot
	TestRoot.Parent = Parent
	Bootstrap.Enabled = true

	local Success, Message = pcall(function()
		local Probe = Fixtures.StartupProbe
		local Deadline = os.clock() + 5
		while Probe:GetAttribute("Started") ~= true and os.clock() < Deadline do
			task.wait()
		end
		assert(Probe:GetAttribute("Started") == true, "Bootstrap did not start its direct child module")
		assert(
			Fixtures.Helpers.DoNotStart:GetAttribute("Started") == nil,
			"Bootstrap started a nested helper"
		)
	end)
	TestRoot:Destroy()
	assert(Success, tostring(Message))
	print("Bootstrap checks passed: " .. (if IsServer then "server" else "client"))
end
