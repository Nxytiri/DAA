--//LuauProgrammer
--//BootstrapSpec
--//2026-11-08
--!strict

local LogService = game:GetService("LogService")
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")
local ServerScriptService = game:GetService("ServerScriptService")
local Log = require(ReplicatedStorage.DAA.Packages.Log)
local Trove = require(ReplicatedStorage.DAA.Packages.Trove)
local Logger = Log.new()

return function(Case: string?): ()
	local IsServer = RunService:IsServer()
	local Parent: Instance = if IsServer
		then ServerScriptService
		else Players.LocalPlayer:WaitForChild("PlayerScripts")
	local DAA = Parent:WaitForChild("DAA")
	local Template = DAA:WaitForChild("Bootstrap")
	assert(Template:IsA("BaseScript"), "Production bootstrap missing")

	local TestTrove = Trove.new()
	local TestRoot = TestTrove:Add(Instance.new("Folder"))
	TestRoot.Name = "DAABootstrapCheck"
	local Fixtures = script.Parent.Fixtures:Clone()
	Fixtures.Name = if IsServer then "Services" else "Controllers"
	local SecondProbe = Fixtures.StartupProbe:Clone()
	SecondProbe.Name = "SecondProbe"
	SecondProbe.Parent = Fixtures
	if Case ~= nil then
		local Failure = script.Parent.Failures[Case]:Clone()
		Failure.Parent = Fixtures
	end
	Fixtures.Parent = TestRoot
	local Bootstrap = Template:Clone()
	Bootstrap.Enabled = false
	Bootstrap.Parent = TestRoot
	TestRoot.Parent = Parent
	local StartFailureReported = false
	if Case == "StartFailure" then
		TestTrove:Connect(LogService.MessageOut, function(Message: string): ()
			if
				string.find(Message, "[DAA/StartFailure] Start failed:", 1, true)
				and string.find(Message, "EXPECTED_START_FAILURE", 1, true)
			then
				StartFailureReported = true
			end
		end)
	end
	Bootstrap.Enabled = true

	local Success, Message = pcall(function(): unknown
		local Probe = Fixtures.StartupProbe
		if Case == "InitFailure" then
			local Deadline = os.clock() + 5
			while Fixtures.InitFailure:GetAttribute("Failed") ~= true and os.clock() < Deadline do
				task.wait()
			end
			assert(Fixtures.InitFailure:GetAttribute("Failed") == true, "Init failure was not reached")
			task.wait(0.1)
			assert(
				Probe:GetAttribute("Starting") == nil and SecondProbe:GetAttribute("Starting") == nil,
				"Start ran after an Init error"
			)
			assert(Fixtures.InitFailure:GetAttribute("Started") == nil, "Failed module was started")
			return nil
		end
		local Deadline = os.clock() + 5
		while
			(Probe:GetAttribute("Started") ~= true or SecondProbe:GetAttribute("Started") ~= true)
			and os.clock() < Deadline
		do
			task.wait()
		end
		assert(Probe:GetAttribute("Started") == true, "Bootstrap did not start its direct child module")
		assert(SecondProbe:GetAttribute("Started") == true, "Second startup hook did not finish")
		if Case == "StartFailure" then
			assert(Fixtures.StartFailure:GetAttribute("Attempted") == true, "Start failure was not reached")
			local ReportDeadline = os.clock() + 5
			while not StartFailureReported and os.clock() < ReportDeadline do
				task.wait()
			end
			assert(StartFailureReported, "Bootstrap did not report the Start failure with module context")
		end
		assert(
			Fixtures.Helpers.DoNotStart:GetAttribute("Started") == nil,
			"Bootstrap started a nested helper"
		)
		return nil
	end)
	TestTrove:Destroy()
	assert(Success, tostring(Message))
	Logger:AtInfo():Log("Bootstrap checks passed: " .. (if IsServer then "server" else "client"))
end
