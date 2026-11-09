--//LuauProgrammer
--//ServerBootstrap
--//2026-11-08
--!strict

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Loader = require(ReplicatedStorage.DAA.Packages.Loader)
local Types = require(ReplicatedStorage.DAA.Shared.Types)

local Services: { [string]: Types.Startup } = Loader.LoadChildren(script.Parent.Services)
Loader.SpawnAll(Services, "OnStart")
